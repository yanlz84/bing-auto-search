// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.377
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
var default_search_words = ["蓝图已绘就 奋进正当时", "手机突然黑屏存款被转走 警方提醒", "普京：核动力巡航导弹全世界独一无二", "未来五年怎么做", "顶级大佬齐呼吁：暂停超级智能研发", "给美军捐1.3亿美元的神秘人身份曝光", "亚洲第一长洞已发现52具熊猫化石", "美方表达立场强硬 中方维护利益坚定", "13岁女孩失联7天竟躲空房间玩手机", "中美马来西亚经贸磋商谈了啥", "长江“病了” 禁渔五年变样了吗", "网民用AI编造3儿子不养老人被罚", "李成钢：中美双方形成初步共识", "何立峰：希望美方与中方相向而行", "建议冬天床单两周换洗一次", "刘亦菲带火满天星簪花", "“吉林一号”放出台岛高清卫星图", "金项链发现大量不明金属 多家店中招", "基辅遭俄弹道导弹袭击 城市一片残骸", "“钱多了有时候不是好事”", "李成钢：中美经贸团队进行了坦诚交流", "2元维C和98元维C的区别", "18万彩礼被扣下 女儿起诉爸妈", "中美在马来西亚吉隆坡举行经贸磋商", "美媒爆料：印度仿制中国霹雳-15导弹", "男子戴墨镜拿口袋抢劫金店 多人围观", "小孩哥发明“自断狗绳”挽救狗命", "哈里斯暗示再竞选总统 白宫尖锐回应", "女子称给电动车充电金镯子被电碎", "AI把玉米片判为枪惊动八辆美国警车", "新生放弃入学 学生姓名有必要公告吗", "新加坡总理：中国是已经崛起的强国", "孕检低风险却生下唐氏儿 保险拒赔", "《沉默的荣耀》中刘咏尧是刘若英爷爷", "特朗普在马来西亚听了个地狱笑话", "顾客买药电话接不通 骑手返店查药效", "35元1个面包被年轻人疯抢", "老虎偷袭黑熊 反挨一巴掌", "毛宁向世界分享中国“人造大阳”", "女孩打翻生日蛋糕 老板把意外变惊喜", "台湾创投公司CEO与女子陈尸豪宅", "张远称仍在和躁郁症“对抗”", "男子下河电鱼致人触电身亡 获刑一年", "董宇辉再喊话合作商家“别送礼”", "卢浮宫抢劫案2名嫌疑人已被捕", "终于明白什么是“跃然纸上”", "全红婵全运会比赛门票1分钟售空", "最长9天 这里中小学生将放“雪假”", "14国联合声明：支持俄乌立即停火", "暗访酒店玉器店：标价88万实际卖几万", "什么样的“微信办公”算加班"]

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
