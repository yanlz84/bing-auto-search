// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.73
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
var default_search_words = ["习近平的文化足迹：薪火相传", "通报！幕后黑手是台湾民进党当局", "端午节3天不调休 高速不免费", "民营企业再获政策加持", "百万存款3年利息从10.5万缩至3.9万", "“牛马困了点杯咖啡”广告已被撤下", "国家网络身份认证筑牢数字安全屏障", "小学生持二维码买煎饼", "70岁寇振海cos陆振华", "美国为什么没有中国那样的高铁", "李亚鹏老婆：分居很久 但没有离婚", "减重专家破解减肥九大谣言", "航拍山东化工厂爆炸：升起大量浓烟", "刘强东点外卖称赞杭州是美食之都", "印度宣称成为全球第四大经济体", "日本民众分食米饭精确到克", "导游称雨果下令烧圆明园 园方回应", "韩国演员崔政宇去世", "高密已接收多名爆炸伤者 亲历者发声", "王健林“断腕式”自救能走多远", "女生考法警进体检被曝曾发极端言论", "两老人送孙子上学在校门口被撞身亡", "20寸行李箱被要求托运 首都航空回应", "70岁周润发又被偶遇爬山 沧桑了不少", "中央文件再提“涨工资”是什么信号", "女子转账输错号码 转给陌生人1000万", "女子吃冷冻肉后头疼欲裂确诊脑膜炎", "男子长期吃外卖患病需终身服药", "男子坐共享单车车篮摔死 同伴担全责", "教育部通知严禁违规频繁考试", "男童车祸身亡 家属：肇事者是干部", "女子手链丢失 拾得者开价800元每克", "胖东来回应286元一瓶白酒现身澳洲", "KTV现在只能靠老年人“续命”", "无人在意藏海被捅 只关心肖战腹肌", "男孩捡到66年前装有情书的漂流瓶", "应急管理部派工作组赴山东爆炸现场", "张一山生日赵丽颖送了两巴掌", "退役仅2年 34岁阿扎尔已胖成球", "微信朋友圈能查看访客？客服回应", "景区回应月薪3万招帅气NPC：属实", "武汉高校教师发前妻隐私视频被解聘", "咆哮医生姜林凯：我想叫醒更多人", "存款千万可推名企实习 涉事银行致歉", "高考临近医生咆哮式喊话考生家长", "#普京专机遇袭俄乌走向又将如何#", "围棋少年坠亡 父亲：警方会还我公道", "驾滑翔伞被吸至8千米男子涉嫌黑飞", "求神拜佛搞迷信活动 吴斑被“双开”", "扬州一清代文物合院618元起拍", "山东一村免费为适龄青年分配楼房"]

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
