// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.328
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["这一天致青年 我们如何赓续与传承", "全国多地突降大雪 有人自驾被困路上", "男子送老人过马路 3次敬礼全网刷屏", "中国假期吸引世界流量", "走失小狗在服务区苦等主人8小时", "多省发文补贴社保个人缴费额的25%", "中国资产大涨", "远看风景美如画 近看全是人", "“一个人”吃出又一万亿元大市场", "爸姓古妈姓顾 AI给孩子取名古菇顾", "“第一天出去旅游的人已老实”", "警方辟谣闺蜜合伙买房反目成仇", "台湾逼人让座被踹老人竟是通缉犯", "美自由女神像或因政府停摆“熄火”", "附近商户感谢鸡排哥：营业额多1000元", "“课本上的传奇”珍·古道尔逝世", "国庆假期 政府大院免费停车火了", "景区人山人海 镜头里全是“人从众”", "狗子渡海而来只为和另一只狗打架", "特朗普：美国面临内部战争", "“国宝中的国宝”来了", "去河南的游客被景区物价惊呆了", "“假装旅行”生意迎订单高峰期", "长假亲子游 这件“行李”成新宠", "不刷手机刷车窗？假期出行新体验", "高速交警巡逻车3年跑了45万多公里", "“还是低估了十一堵车的程度”", "中国巨型X光机今年年底试运行", "总台2025年中秋晚会录制完成", "女子参加闺蜜婚礼翻山越岭连闯多关", "马斯克个人财富达5000亿美元", "俄罗斯石脑油最大买家 居然是台湾", "特朗普吐槽美军军舰丑爆了：我不喜欢", "刘国梁王励勤久违同框观赛", "老外排队4小时吃上鸡排直接飙中文", "南非驻法大使跳楼前发诀别短信", "菲律宾地震遇难人数升至72人", "美国纽约一高层公寓楼部分倒塌", "撒贝宁在“中国第一麦”之乡剥花生", "家长称鸡排哥和孩子们关系好", "台风麦德姆将生成 或再袭华南", "《窗外是蓝星》在德国多地亮相", "捷运公司回应老人强行要年轻人让座", "甘肃张掖市肃南县发生3.3级地震", "美官员称特朗普已批准向乌提供情报", "万斯警告美政府持续停摆或引发裁员", "宠物乐园饲养员遭寄养黑犬撕咬", "俄控制一新居民点 乌称击退俄军进攻", "阿云嘎《人民日报》撰文", "苏丹西部城市遭无人机袭击 8人死亡", "朝鲜国防相努光铁访问俄罗斯"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
